'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Image, MoreHorizontal, Bold, Italic, Link, List, Quote, Plus, X, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TiptapEditor } from '@/components/editor/TiptapEditor';

// Publish Modal Component
function PublishModal({
    isOpen,
    onClose,
    formData,
    onPublish,
    onUpdate,
    sendToNewsletter,
    onNewsletterToggle
}: {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        title: string;
        content: string;
        slug: string;
        excerpt: string;
        category: string;
        tags: string;
        seo_title: string;
        seo_description: string;
        image_url: string;
    };
    onPublish: () => void;
    onUpdate: (field: string, value: string) => void;
    sendToNewsletter: boolean;
    onNewsletterToggle: (value: boolean) => void;
}) {
    if (!isOpen) return null;

    const categories = ['Operations', 'Tech', 'Business', 'Mindset', 'Strategy', 'Productivity'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Ready to publish?</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Story Preview */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-600 mb-3">Story Preview</h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 mb-4 text-center bg-slate-50">
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                ) : (
                                    <div className="text-slate-400">
                                        <Image size={32} className="mx-auto mb-2" />
                                        <p className="text-sm">Include a high-quality image to make it more inviting</p>
                                    </div>
                                )}
                            </div>
                            <input
                                value={formData.image_url}
                                onChange={(e) => onUpdate('image_url', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                                placeholder="Image URL..."
                            />
                            <input
                                value={formData.excerpt}
                                onChange={(e) => onUpdate('excerpt', e.target.value)}
                                className="w-full p-2 border-b border-slate-200 text-sm"
                                placeholder="Write a preview subtitle..."
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                This affects how your story appears in public places
                            </p>
                        </div>

                        {/* Right: Publishing Options */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-600 mb-3">Publishing to: <span className="text-slate-900">Asrul Basri</span></h3>

                            {/* Category/Topic */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-600 mb-1">Topic (auto-detected)</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => onUpdate('category', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                >
                                    <option value="">Select topic</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-600 mb-1">Tags</label>
                                <input
                                    value={formData.tags}
                                    onChange={(e) => onUpdate('tags', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg"
                                    placeholder="startup, tips, guide"
                                />
                            </div>

                            {/* SEO Section with Score */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                {(() => {
                                    const seoResult = calculateSEOScore({
                                        title: formData.title,
                                        seo_title: formData.seo_title,
                                        seo_description: formData.seo_description,
                                        content: formData.content,
                                        image_url: formData.image_url,
                                        excerpt: formData.excerpt,
                                    });

                                    return (
                                        <>
                                            {/* SEO Score Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                    🔍 SEO Score
                                                </h4>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${seoResult.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                    seoResult.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {seoResult.score >= 80 ? '✓' : seoResult.score >= 50 ? '!' : '✗'} {seoResult.score}%
                                                </div>
                                            </div>

                                            {/* SEO Checklist */}
                                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg mb-4">
                                                {seoResult.checks.map((check, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <span className={check.passed ? 'text-emerald-500' : 'text-slate-300'}>
                                                            {check.passed ? '✓' : '○'}
                                                        </span>
                                                        <span className={check.passed ? 'text-slate-700' : 'text-slate-600'}>
                                                            {check.label}
                                                        </span>
                                                        <span className="text-xs text-slate-400 ml-auto">
                                                            {check.tip}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* SEO Fields */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs text-slate-600 mb-1">SEO Title</label>
                                                    <input
                                                        value={formData.seo_title}
                                                        onChange={(e) => onUpdate('seo_title', e.target.value)}
                                                        className="w-full p-2 border border-slate-200 rounded text-sm"
                                                        maxLength={60}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-1">{formData.seo_title.length}/60</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-600 mb-1">Meta Description</label>
                                                    <textarea
                                                        value={formData.seo_description}
                                                        onChange={(e) => onUpdate('seo_description', e.target.value)}
                                                        className="w-full p-2 border border-slate-200 rounded text-sm h-16"
                                                        maxLength={160}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-1">{formData.seo_description.length}/160</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-600 mb-1">URL Slug</label>
                                                    <input
                                                        value={formData.slug}
                                                        onChange={(e) => onUpdate('slug', e.target.value)}
                                                        className="w-full p-2 border border-slate-200 rounded text-sm font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Option */}
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendToNewsletter}
                                onChange={(e) => onNewsletterToggle(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                                <span className="font-medium text-slate-700">Send to newsletter subscribers</span>
                                <p className="text-sm text-slate-600">Notify subscribers about this new article via email</p>
                            </div>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6 pt-6 border-t border-slate-200">
                        <button
                            onClick={onPublish}
                            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors"
                        >
                            Publish now
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-slate-600 hover:text-slate-900"
                        >
                            Schedule for later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Auto-detect category based on keywords
function detectCategory(content: string): string {
    const text = content.toLowerCase();
    const keywords: { [key: string]: string[] } = {
        'Tech': ['code', 'programming', 'software', 'api', 'developer', 'javascript', 'react', 'database'],
        'Business': ['revenue', 'profit', 'customer', 'market', 'sales', 'startup', 'company', 'business'],
        'Operations': ['process', 'workflow', 'system', 'automation', 'efficiency', 'operations', 'sop'],
        'Strategy': ['strategy', 'plan', 'goal', 'vision', 'mission', 'competitive', 'growth'],
        'Productivity': ['productivity', 'time', 'focus', 'habit', 'routine', 'efficiency', 'work'],
        'Mindset': ['mindset', 'mental', 'motivation', 'psychology', 'thinking', 'attitude', 'belief'],
    };

    let maxScore = 0;
    let detected = '';

    for (const [category, words] of Object.entries(keywords)) {
        const score = words.filter(word => text.includes(word)).length;
        if (score > maxScore) {
            maxScore = score;
            detected = category;
        }
    }

    return detected;
}

// SEO Score Calculator
function calculateSEOScore(data: {
    title: string;
    seo_title: string;
    seo_description: string;
    content: string;
    image_url: string;
    excerpt: string;
}): { score: number; checks: { label: string; passed: boolean; tip: string }[] } {
    const checks: { label: string; passed: boolean; tip: string }[] = [];

    // 1. Title length (50-60 chars ideal)
    const titleLength = data.seo_title.length || data.title.length;
    checks.push({
        label: 'SEO Title (50-60 chars)',
        passed: titleLength >= 50 && titleLength <= 60,
        tip: titleLength < 50 ? 'Make title longer' : titleLength > 60 ? 'Shorten title' : 'Perfect!'
    });

    // 2. Meta description (120-160 chars ideal)
    const descLength = data.seo_description.length || data.excerpt.length;
    checks.push({
        label: 'Meta Description (120-160 chars)',
        passed: descLength >= 120 && descLength <= 160,
        tip: descLength < 120 ? 'Add more description' : descLength > 160 ? 'Too long' : 'Perfect!'
    });

    // 3. Has featured image
    checks.push({
        label: 'Featured Image',
        passed: !!data.image_url && data.image_url.length > 0,
        tip: data.image_url ? 'Image added!' : 'Add an image for better engagement'
    });

    // 4. Content length (300+ words)
    const wordCount = data.content.trim().split(/\s+/).length;
    checks.push({
        label: 'Content Length (300+ words)',
        passed: wordCount >= 300,
        tip: wordCount < 300 ? `Add ${300 - wordCount} more words` : `${wordCount} words - Good!`
    });

    // 5. Has headings (H2/H3)
    const hasHeadings = data.content.includes('<h2') || data.content.includes('<h3') ||
        data.content.includes('## ') || data.content.includes('### ');
    checks.push({
        label: 'Uses Headings (H2, H3)',
        passed: hasHeadings,
        tip: hasHeadings ? 'Good structure!' : 'Add headings to improve readability'
    });

    // 6. Excerpt filled
    checks.push({
        label: 'Preview Subtitle',
        passed: data.excerpt.length >= 50,
        tip: data.excerpt.length >= 50 ? 'Looking good!' : 'Add a compelling preview'
    });

    // Calculate score (each check = ~16.6%)
    const passedCount = checks.filter(c => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { score, checks };
}

// Selection Toolbar Component - appears when text is selected
function SelectionToolbar({
    position,
    onFormat,
    onClose
}: {
    position: { top: number; left: number } | null;
    onFormat: (type: string) => void;
    onClose: () => void;
}) {
    if (!position) return null;

    const tools = [
        { label: 'Bold', icon: 'B', style: 'font-bold', action: 'bold' },
        { label: 'Italic', icon: 'i', style: 'italic', action: 'italic' },
        { label: 'Link', icon: '🔗', style: '', action: 'link' },
        { label: 'Large heading', icon: 'T', style: 'text-lg font-bold', action: 'h2' },
        { label: 'Small heading', icon: 'T', style: 'text-sm', action: 'h3' },
        { label: 'Quote', icon: '«', style: '', action: 'quote' },
    ];

    return (
        <div
            className="fixed z-50 flex items-center bg-slate-900 rounded-lg shadow-xl px-1 py-1 animate-fade-in"
            style={{
                top: position.top - 50,
                left: position.left,
                transform: 'translateX(-50%)'
            }}
        >
            {tools.map((tool, index) => (
                <span key={tool.action} className="flex items-center">
                    <button
                        onClick={() => { onFormat(tool.action); onClose(); }}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded ${tool.style}`}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                    {(index === 2 || index === 4) && (
                        <span className="w-px h-6 bg-slate-700 mx-1" />
                    )}
                </span>
            ))}
        </div>
    );
}

// Floating Toolbar Component
function FloatingToolbar({
    isOpen,
    onClose,
    onInsert
}: {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (text: string) => void;
}) {
    if (!isOpen) return null;

    const tools = [
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            ),
            label: 'Add image',
            action: () => onInsert('\n![Image description](https://your-image-url.jpg)\n')
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
                    <path d="M21 15l-5-5L5 21" fill="white" />
                </svg>
            ),
            label: 'Search Unsplash',
            action: () => {
                const keyword = prompt('Enter Unsplash keyword:');
                if (keyword) {
                    onInsert(`\n![${keyword}](https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)})\n`);
                }
            }
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polygon points="10,8 10,16 16,12" fill="currentColor" />
                </svg>
            ),
            label: 'Embed video',
            action: () => {
                const url = prompt('Enter YouTube or video URL:');
                if (url) {
                    // Convert YouTube URL to embed
                    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
                    if (videoId) {
                        onInsert(`\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`);
                    } else {
                        onInsert(`\n[Video: ${url}]\n`);
                    }
                }
            }
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
            ),
            label: 'Embed link',
            action: () => {
                const url = prompt('Enter URL to embed:');
                if (url) {
                    onInsert(`\n[📎 Embedded: ${url}](${url})\n`);
                }
            }
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
            ),
            label: 'Code block',
            action: () => onInsert('\n```\n// Your code here\n```\n')
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="18" cy="12" r="1.5" />
                </svg>
            ),
            label: 'Add divider',
            action: () => onInsert('\n\n---\n\n')
        },
    ];

    return (
        <div className="flex items-center gap-1 p-2 bg-white border border-slate-200 rounded-full shadow-lg animate-fade-in">
            <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
                title="Close menu"
            >
                <X size={20} />
            </button>
            {tools.map((tool) => (
                <button
                    key={tool.label}
                    onClick={() => { tool.action(); onClose(); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                    title={tool.label}
                >
                    <tool.icon />
                </button>
            ))}
        </div>
    );
}

function WritePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editPostId = searchParams.get('edit');
    const isEditMode = !!editPostId;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [draftId, setDraftId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Selection toolbar state
    const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: '' });
    const contentRef = React.useRef<HTMLTextAreaElement>(null);

    // SEO fields (auto-generated)
    const [seoData, setSeoData] = useState({
        slug: '',
        excerpt: '',
        category: '',
        tags: '',
        seo_title: '',
        seo_description: '',
        image_url: '',
    });

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState('');

    // Word count goal state
    const [wordCountGoal, setWordCountGoal] = useState(500);
    const [showGoalPicker, setShowGoalPicker] = useState(false);

    // Newsletter toggle state
    const [sendToNewsletter, setSendToNewsletter] = useState(false);

    // Calculate word count and reading time
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const goalProgress = Math.min(100, Math.round((wordCount / wordCountGoal) * 100));

    // Load existing post for editing
    useEffect(() => {
        async function loadPost() {
            if (!editPostId) return;

            setLoading(true);
            try {
                // Use API to fetch post data (bypasses RLS)
                const response = await fetch(`/api/blog/get?id=${editPostId}`);
                const result = await response.json();

                if (result.post) {
                    const postData = result.post;
                    setTitle(postData.title || '');
                    setContent(postData.content || '');
                    setDraftId(postData.id);
                    setSeoData({
                        slug: postData.slug || '',
                        excerpt: postData.excerpt || '',
                        category: postData.category || '',
                        tags: postData.tags || '',
                        seo_title: postData.seo_title || '',
                        seo_description: postData.seo_description || '',
                        image_url: postData.image_url || '',
                    });
                } else {
                    console.error('Post not found:', result.error);
                }
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        }

        loadPost();
    }, [editPostId]);

    // Auto-save draft (debounced)
    const saveDraft = useCallback(async () => {
        if (!title.trim() && !content.trim()) return;

        setSaving(true);
        try {
            const draftData = {
                title: title || 'Untitled',
                content,
                status: 'Draft',
                author: 'Asrul Basri',
            };

            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save-draft',
                    postId: draftId,
                    postData: draftData
                })
            });

            const result = await response.json();

            if (response.ok && result.id && !draftId) {
                setDraftId(result.id);
            }

            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save error:', error);
        } finally {
            setSaving(false);
        }
    }, [title, content, draftId]);

    // Debounced auto-save (every 5 seconds after changes)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (title.trim() || content.trim()) {
                saveDraft();
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [title, content, saveDraft]);

    // Save draft before leaving page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if ((title.trim() || content.trim()) && !lastSaved) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [title, content, lastSaved]);

    // Handle back button - save draft first then navigate
    const handleBack = async () => {
        if (title.trim() || content.trim()) {
            await saveDraft();
        }
        router.push('/dashboard/content');
    };

    // Insert text at cursor
    const handleInsert = (text: string) => {
        setContent(prev => prev + text);
    };

    // Handle text selection
    const handleSelection = () => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = content.substring(start, end);

        if (text.length > 0) {
            // Get position for toolbar
            const rect = textarea.getBoundingClientRect();
            const lineHeight = 28;
            const lines = content.substring(0, start).split('\n').length;

            setSelectedText({ start, end, text });
            setSelectionPosition({
                top: rect.top + (lines * lineHeight) - textarea.scrollTop,
                left: rect.left + (rect.width / 2)
            });
        } else {
            setSelectionPosition(null);
        }
    };

    // Format selected text
    const handleFormat = (type: string) => {
        const { start, end, text } = selectedText;
        if (!text) return;

        let formattedText = '';
        switch (type) {
            case 'bold':
                formattedText = `**${text}**`;
                break;
            case 'italic':
                formattedText = `*${text}*`;
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    formattedText = `[${text}](${url})`;
                } else {
                    return;
                }
                break;
            case 'h2':
                formattedText = `\n## ${text}\n`;
                break;
            case 'h3':
                formattedText = `\n### ${text}\n`;
                break;
            case 'quote':
                formattedText = `\n> ${text}\n`;
                break;
            default:
                return;
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        setContent(newContent);
        setSelectionPosition(null);
    };

    // Generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Calculate read time
    const calculateReadTime = (text: string) => {
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min`;
    };

    // Auto-generate SEO when opening publish modal
    const handlePublishClick = () => {
        // Strip HTML tags from content for clean excerpt
        const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();
        const cleanContent = stripHtml(content);
        const excerpt = cleanContent.slice(0, 160).replace(/\n/g, ' ').trim();
        const detectedCategory = detectCategory(content);

        // Extract first image URL from content if exists
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        const firstImageUrl = imgMatch ? imgMatch[1] : '';

        setSeoData({
            slug: generateSlug(title),
            excerpt: excerpt,
            category: detectedCategory,
            tags: '',
            seo_title: `${title} | Asrul Basri`.slice(0, 60),
            seo_description: excerpt,
            image_url: firstImageUrl,
        });

        setShowPublishModal(true);
    };

    // Update SEO field
    const updateSeoField = (field: string, value: string) => {
        setSeoData(prev => ({ ...prev, [field]: value }));
    };

    // Publish article
    const handlePublish = async () => {
        try {
            setSaving(true);

            // Ensure slug is generated
            const finalSlug = seoData.slug || generateSlug(title);

            if (!finalSlug) {
                alert('Please provide a title for your post.');
                return;
            }

            const postData = {
                title,
                content,
                slug: finalSlug,
                excerpt: seoData.excerpt,
                category: seoData.category,
                tags: seoData.tags,
                seo_title: seoData.seo_title || title,
                seo_description: seoData.seo_description || seoData.excerpt,
                image_url: seoData.image_url,
                status: 'Published',
                author: 'Asrul Basri',
                read_time: calculateReadTime(content),
                featured: false,
                publish_date: new Date().toISOString(),
            };

            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'publish',
                    postId: draftId,
                    postData
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to publish');
            }

            setShowPublishModal(false);

            // Show success modal instead of alert
            const articleUrl = `${window.location.origin}/articles/${finalSlug}`;
            setPublishedUrl(articleUrl);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error publishing:', error);
            alert('Error publishing. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="text-slate-400 hover:text-slate-600"
                        title="Save as draft and exit"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-sm text-slate-400">
                        {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Draft'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Word count and reading time with goal picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowGoalPicker(!showGoalPicker)}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition"
                        >
                            <span className={goalProgress >= 100 ? 'text-emerald-600 font-medium' : ''}>
                                {wordCount}/{wordCountGoal}
                            </span>
                            <span>·</span>
                            <span>{readingTime} min read</span>
                        </button>

                        {/* Goal picker dropdown */}
                        {showGoalPicker && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 w-48">
                                <p className="text-xs font-medium text-slate-600 mb-2">Word Count Goal</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[300, 500, 750, 1000, 1500, 2000].map(goal => (
                                        <button
                                            key={goal}
                                            onClick={() => { setWordCountGoal(goal); setShowGoalPicker(false); }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${wordCountGoal === goal
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {goal}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={20} />
                    </button>
                    <button
                        onClick={handlePublishClick}
                        disabled={!title.trim() || !content.trim()}
                        className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Publish
                    </button>
                </div>
            </header>

            {/* Word Count Goal Progress Bar */}
            {wordCountGoal > 0 && wordCount > 0 && (
                <div className="fixed top-16 left-0 right-0 h-1 bg-slate-100 z-30">
                    <div
                        className={`h-full transition-all duration-300 ${goalProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${goalProgress}%` }}
                    />
                </div>
            )}

            {/* Editor Area */}
            <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto">
                {/* Title */}
                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full text-4xl font-serif font-bold text-slate-900 placeholder-slate-300 border-none outline-none resize-none mb-4"
                    rows={1}
                    style={{ overflow: 'hidden' }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }}
                />

                {/* WYSIWYG Content Editor */}
                <div className="relative pl-16">
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Tell your story..."
                    />
                </div>

                {/* Word Count */}
                {wordCount > 0 && (
                    <div className="fixed bottom-6 left-6 text-sm text-slate-400">
                        {saving ? '💾 Saving...' : `${wordCount} words · ${calculateReadTime(content)} read`}
                    </div>
                )}
            </main>

            {/* Publish Modal */}
            <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                formData={{ title, content, ...seoData }}
                onPublish={handlePublish}
                onUpdate={updateSeoField}
                sendToNewsletter={sendToNewsletter}
                onNewsletterToggle={setSendToNewsletter}
            />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.push('/dashboard/content');
                            }}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                            <X size={16} />
                        </button>

                        {/* Title */}
                        <h2 className="text-2xl font-serif font-bold text-center mb-2">
                            Your story is published!
                        </h2>
                        <p className="text-slate-600 text-center mb-6">
                            Your article is now live. Share it with the world!
                        </p>

                        <hr className="my-6" />

                        {/* Share section */}
                        <p className="text-sm text-slate-600 text-center mb-4">
                            Share your story with the world.
                        </p>

                        <div className="space-y-3">
                            {/* Copy Link */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(publishedUrl);
                                    alert('Link copied!');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span className="flex-1">Copy link</span>
                            </button>

                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`Check out my new article: ${title} ${publishedUrl}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span className="flex-1">Share on WhatsApp</span>
                            </a>

                            {/* Facebook */}
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="flex-1">Share on Facebook</span>
                            </a>

                            {/* X (Twitter) */}
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my new article: ${title}`)}&url=${encodeURIComponent(publishedUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="flex-1">Share on X</span>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(publishedUrl)}&title=${encodeURIComponent(title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span className="flex-1">Share on LinkedIn</span>
                            </a>
                        </div>

                        {/* View Article button */}
                        <a
                            href={publishedUrl}
                            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-medium"
                        >
                            <Eye size={18} />
                            View Article
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

// Wrapper with Suspense for useSearchParams
export default function WritePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        }>
            <WritePageContent />
        </Suspense>
    );
}
