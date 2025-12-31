'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = 'Tell your story...' }: TiptapEditorProps) {
    const [showBubbleMenu, setShowBubbleMenu] = useState(false);
    const [bubbleMenuPos, setBubbleMenuPos] = useState({ top: 0, left: 0 });
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [plusButtonPos, setPlusButtonPos] = useState({ top: 0 });
    const [cursorOnEmptyLine, setCursorOnEmptyLine] = useState(false);
    const [uploading, setUploading] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full mx-auto my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-emerald-600 underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;

            // Check for text selection (bubble menu)
            if (from !== to) {
                const coords = editor.view.coordsAtPos(from);
                if (editorRef.current) {
                    const rect = editorRef.current.getBoundingClientRect();
                    setBubbleMenuPos({
                        top: coords.top - rect.top - 50,
                        left: (coords.left - rect.left + editor.view.coordsAtPos(to).left - rect.left) / 2
                    });
                }
                setShowBubbleMenu(true);
                setShowPlusMenu(false);
            } else {
                setShowBubbleMenu(false);

                // Show plus button on the left of current line (all lines, not just empty)
                if (editorRef.current) {
                    const coords = editor.view.coordsAtPos(from);
                    const rect = editorRef.current.getBoundingClientRect();
                    setPlusButtonPos({
                        top: coords.top - rect.top - 4
                    });
                    setCursorOnEmptyLine(true); // Always show plus button
                }
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] text-slate-700',
                style: 'font-family: Georgia, serif;',
            },
        },
    });

    // Update editor content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);
        // Trigger file input click
        fileInputRef.current?.click();
    }, [editor]);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setUploading(true);
        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `blog-images/${fileName}`;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                // Fallback: create object URL for preview
                const objectUrl = URL.createObjectURL(file);
                editor.chain().focus().setImage({ src: objectUrl }).run();
                alert('Image uploaded locally (storage not configured). For permanent storage, setup Supabase Storage.');
            } else {
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(filePath);

                editor.chain().focus().setImage({ src: publicUrl }).run();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            // Fallback to object URL
            const objectUrl = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: objectUrl }).run();
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor]);

    const searchUnsplash = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);

        // Use Lorem Picsum for random images (Unsplash source API is deprecated)
        const options = [
            { label: 'Random Tech Image', url: 'https://picsum.photos/seed/tech/800/600' },
            { label: 'Random Business Image', url: 'https://picsum.photos/seed/business/800/600' },
            { label: 'Random Nature Image', url: 'https://picsum.photos/seed/nature/800/600' },
            { label: 'Random City Image', url: 'https://picsum.photos/seed/city/800/600' },
            { label: 'Random Abstract Image', url: 'https://picsum.photos/seed/abstract/800/600' },
        ];

        const keyword = window.prompt('Enter image type (tech, business, nature, city, abstract) or leave empty for random:');
        const seed = keyword?.trim() || Math.random().toString(36).substring(7);
        const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

        editor.chain().focus().setImage({ src: url, alt: keyword || 'Image' }).run();
    }, [editor]);

    const addVideo = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);
        const url = window.prompt('Enter YouTube URL:');
        if (url) {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
            if (videoId) {
                editor.chain().focus().insertContent(`<p><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></p>`).run();
            }
        }
    }, [editor]);

    const addEmbed = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);
        const url = window.prompt('Enter URL to embed:');
        if (url) {
            editor.chain().focus().insertContent(`<p><a href="${url}" target="_blank">📎 ${url}</a></p>`).run();
        }
    }, [editor]);

    const addCodeBlock = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);
        editor.chain().focus().toggleCodeBlock().run();
    }, [editor]);

    const addDivider = useCallback(() => {
        if (!editor) return;
        setShowPlusMenu(false);
        editor.chain().focus().setHorizontalRule().run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="relative" ref={editorRef}>
            {/* Hidden file input for image upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />

            {/* Upload indicator */}
            {uploading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                        <span>Uploading image...</span>
                    </div>
                </div>
            )}

            {/* Bubble Menu - appears when text is selected */}
            {showBubbleMenu && (
                <div
                    className="absolute z-50 flex items-center bg-slate-900 rounded-lg shadow-xl px-1 py-1 animate-fade-in"
                    style={{
                        top: bubbleMenuPos.top,
                        left: bubbleMenuPos.left,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded font-bold ${editor.isActive('bold') ? 'bg-slate-700' : ''}`}
                        title="Bold"
                    >
                        B
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded italic ${editor.isActive('italic') ? 'bg-slate-700' : ''}`}
                        title="Italic"
                    >
                        i
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={setLink}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded ${editor.isActive('link') ? 'bg-slate-700' : ''}`}
                        title="Link"
                    >
                        🔗
                    </button>
                    <span className="w-px h-6 bg-slate-700 mx-1" />
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded text-lg font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700' : ''}`}
                        title="Large Heading"
                    >
                        T
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-700' : ''}`}
                        title="Small Heading"
                    >
                        T
                    </button>
                    <span className="w-px h-6 bg-slate-700 mx-1" />
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`px-3 py-2 text-white hover:bg-slate-700 rounded ${editor.isActive('blockquote') ? 'bg-slate-700' : ''}`}
                        title="Quote"
                    >
                        «
                    </button>
                </div>
            )}

            {/* Plus Button - appears on the left of current line */}
            {cursorOnEmptyLine && (
                <div
                    className="absolute z-40 flex items-center gap-1"
                    style={{ top: plusButtonPos.top, left: -48 }}
                >
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all ${showPlusMenu ? 'rotate-45 text-emerald-600 border-emerald-300' : ''}`}
                        title={showPlusMenu ? 'Close menu' : 'Add content'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>

                    {/* Expanded Menu - 6 options */}
                    {showPlusMenu && (
                        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-lg animate-fade-in">
                            {/* 1. Image Upload */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addImage}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Upload image"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                </svg>
                            </button>
                            {/* 2. Unsplash/Picsum */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={searchUnsplash}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200 bg-emerald-50"
                                title="Search stock photos"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
                                    <path d="M21 15l-5-5L5 21" fill="white" />
                                </svg>
                            </button>
                            {/* 3. Video Link */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addVideo}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Embed video"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <polygon points="10,8 10,16 16,12" fill="currentColor" />
                                </svg>
                            </button>
                            {/* 4. Embed */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addEmbed}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Embed link"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                            </button>
                            {/* 5. Code Block */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addCodeBlock}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Code block"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                    <polyline points="16,18 22,12 16,6" />
                                    <polyline points="8,6 2,12 8,18" />
                                </svg>
                            </button>
                            {/* 6. Separator/New Part */}
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addDivider}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Add separator"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <circle cx="6" cy="12" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="18" cy="12" r="1.5" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Editor Styles */}
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                .ProseMirror h1 {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ProseMirror h2 {
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                }
                .ProseMirror h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror blockquote {
                    border-left: 4px solid #10b981;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #64748b;
                    margin: 1rem 0;
                }
                .ProseMirror pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                }
                .ProseMirror code {
                    background: #f1f5f9;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                .ProseMirror pre code {
                    background: none;
                    color: inherit;
                    padding: 0;
                }
                .ProseMirror hr {
                    border: none;
                    border-top: 1px solid #e2e8f0;
                    margin: 2rem 0;
                }
                .ProseMirror ul {
                    list-style: disc;
                    padding-left: 1.5rem;
                }
                .ProseMirror ol {
                    list-style: decimal;
                    padding-left: 1.5rem;
                }
                .animate-fade-in {
                    animation: fadeIn 0.15s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}
