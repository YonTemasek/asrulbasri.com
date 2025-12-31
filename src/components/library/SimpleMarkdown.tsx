'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SimpleMarkdownProps {
    content: string;
}

export function SimpleMarkdown({ content }: SimpleMarkdownProps) {
    if (!content) return null;

    return (
        <div className="prose prose-stone prose-lg max-w-none font-serif text-slate-900 leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-8 mb-6 text-slate-900 border-b border-slate-300 pb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-800">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-800">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 text-lg leading-relaxed text-slate-800">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-slate-900">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-slate-700">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-slate-600 my-4 bg-slate-50 py-2 rounded-r">
                            {children}
                        </blockquote>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-lg text-slate-800">{children}</li>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-100">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-200">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-slate-50">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-b border-slate-300">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-slate-600 border-b border-slate-100">
                            {children}
                        </td>
                    ),
                    hr: () => (
                        <hr className="my-8 border-t border-slate-300" />
                    ),
                    code: ({ className, children }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="text-sm font-mono whitespace-pre-wrap">{children}</code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-slate-100 text-slate-800 p-4 rounded-lg overflow-x-auto my-4 whitespace-pre-wrap font-mono text-sm">
                            {children}
                        </pre>
                    ),
                    a: ({ href, children }) => (
                        <a href={href} className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
