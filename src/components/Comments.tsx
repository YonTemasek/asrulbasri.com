'use client';

import React, { useState, useEffect } from 'react';
import { BlogComment } from '@/lib/supabase';

interface CommentsProps {
    postId: number;
}

export function Comments({ postId }: CommentsProps) {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        content: ''
    });

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/comments?postId=${postId}&status=approved`);
            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.content.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    postId,
                    authorName: formData.name,
                    authorEmail: formData.email,
                    content: formData.content
                })
            });

            if (response.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', content: '' });
                // Don't refetch - comment is pending approval
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-2xl font-serif font-bold mb-6">
                Comments {comments.length > 0 && <span className="text-slate-400">({comments.length})</span>}
            </h3>

            {/* Comment Form */}
            {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                    <p className="text-emerald-800 font-medium">✓ Thank you for your comment!</p>
                    <p className="text-emerald-600 text-sm mt-1">Your comment is pending review and will appear once approved.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-4 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                        Write another comment
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                placeholder="your@email.com (optional)"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Comment *</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white h-32 resize-none"
                            placeholder="Share your thoughts..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || !formData.name.trim() || !formData.content.trim()}
                        className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Submitting...' : 'Post Comment'}
                    </button>
                </form>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-700 font-bold text-sm">
                                    {comment.author_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-slate-900">{comment.author_name}</span>
                                    <span className="text-sm text-slate-400">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-600 text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                </p>
            )}
        </div>
    );
}
