'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function DownloadPage() {
    const params = useParams();
    const token = params.token as string;
    const [status, setStatus] = useState<'ready' | 'success' | 'expired' | 'error'>('ready');
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await fetch(`/api/download/${token}`);

            if (response.status === 404) {
                setStatus('error');
                return;
            }

            if (response.status === 410) {
                setStatus('expired');
                return;
            }

            if (!response.ok) {
                setStatus('error');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'ebook.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setStatus('success');
        } catch (error) {
            console.error('Download error:', error);
            setStatus('error');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'ready' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Download className="text-emerald-600" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Download Your Ebook</h1>
                        <p className="text-slate-600 mb-6">Click below to download your PDF.</p>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-emerald-600" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Download Complete!</h1>
                        <p className="text-slate-600 mb-6">Your PDF has been downloaded successfully.</p>
                        <a
                            href="/library"
                            className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Back to Library
                        </a>
                    </>
                )}

                {status === 'expired' && (
                    <>
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-amber-600" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Expired</h1>
                        <p className="text-slate-600 mb-6">
                            This download link has expired. Please request a new link.
                        </p>
                        <a
                            href="/library"
                            className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Go to Library
                        </a>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-red-600" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid Link</h1>
                        <p className="text-slate-600 mb-6">
                            This link is not valid. Please check your email or request a new link.
                        </p>
                        <a
                            href="/library"
                            className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Go to Library
                        </a>
                    </>
                )}

                <p className="text-xs text-slate-400 mt-8">
                    Having trouble? Contact us at hello@asrulbasri.com
                </p>
            </div>
        </div>
    );
}
