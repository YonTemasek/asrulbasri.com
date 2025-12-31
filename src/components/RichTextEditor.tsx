'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChange = useRef(false);

    // Only set content on initial mount or when value changes externally
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            // Only update if content is different (external change)
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
        isInternalChange.current = false;
    }, [value]);

    const execCommand = useCallback((command: string, cmdValue?: string) => {
        document.execCommand(command, false, cmdValue);
        // Update parent with new content
        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Clean pasted HTML and format plain text with proper structure
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        let cleanHtml = '';

        if (html && html.includes('<')) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Remove all style attributes and classes
            temp.querySelectorAll('*').forEach(el => {
                el.removeAttribute('style');
                el.removeAttribute('class');
                el.removeAttribute('id');
            });

            cleanHtml = temp.innerHTML
                .replace(/<span[^>]*>/gi, '')
                .replace(/<\/span>/gi, '')
                .replace(/<div[^>]*>/gi, '<p>')
                .replace(/<\/div>/gi, '</p>')
                .replace(/<b>/gi, '<strong>')
                .replace(/<\/b>/gi, '</strong>')
                .replace(/<i>/gi, '<em>')
                .replace(/<\/i>/gi, '</em>')
                .replace(/<p>\s*<\/p>/g, '');
        } else if (text) {
            // Process plain text - detect structure
            const lines = text.split('\n');
            const result: string[] = [];
            let currentParagraph: string[] = [];

            const flushParagraph = () => {
                if (currentParagraph.length > 0) {
                    result.push(`<p>${currentParagraph.join('<br>')}</p>`);
                    currentParagraph = [];
                }
            };

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed) {
                    flushParagraph();
                    continue;
                }

                // Match main section headings: "1. Title" or "1. Title Here"
                const mainHeading = trimmed.match(/^(\d+)\.\s+([A-Z][^.!?]*?)$/);
                if (mainHeading) {
                    flushParagraph();
                    result.push(`<h2>${mainHeading[1]}. ${mainHeading[2]}</h2>`);
                    continue;
                }

                // Match sub-section headings: "A. Title" or "B. Title Here"
                const subHeading = trimmed.match(/^([A-Z])\.\s+([A-Z][^.!?]*?)$/);
                if (subHeading) {
                    flushParagraph();
                    result.push(`<h3>${subHeading[1]}. ${subHeading[2]}</h3>`);
                    continue;
                }

                // Check if line starts with "You may:" or "You may not:" - make it bold
                if (trimmed.match(/^You may( not)?:/i)) {
                    flushParagraph();
                    result.push(`<p><strong>${trimmed}</strong></p>`);
                    continue;
                }

                // Regular line - add to current paragraph
                currentParagraph.push(trimmed);
            }

            flushParagraph();
            cleanHtml = result.join('');
        }

        document.execCommand('insertHTML', false, cleanHtml);

        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const ToolbarButton = ({
        icon: Icon,
        command,
        value: cmdValue,
        title
    }: {
        icon: React.ElementType;
        command: string;
        value?: string;
        title: string;
    }) => (
        <button
            type="button"
            onClick={() => execCommand(command, cmdValue)}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title={title}
        >
            <Icon size={18} className="text-slate-600" />
        </button>
    );

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 flex-wrap">
                <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
                <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h2')}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Heading 2"
                >
                    <Heading2 size={18} className="text-slate-600" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h3')}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Heading 3"
                >
                    <Heading3 size={18} className="text-slate-600" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'p')}
                    className="px-3 py-1.5 hover:bg-slate-100 rounded transition-colors text-sm font-medium text-slate-600"
                    title="Paragraph"
                >
                    P
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
                <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) execCommand('createLink', url);
                    }}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Insert Link"
                >
                    <Link size={18} className="text-slate-600" />
                </button>

                <div className="flex-1" />

                <ToolbarButton icon={Undo} command="undo" title="Undo" />
                <ToolbarButton icon={Redo} command="redo" title="Redo" />
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="min-h-[400px] p-4 focus:outline-none prose prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900
                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                    prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                    prose-li:text-slate-600 prose-li:mb-1
                    prose-a:text-emerald-600 prose-a:underline"
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />
        </div>
    );
}
