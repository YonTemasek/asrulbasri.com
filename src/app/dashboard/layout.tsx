'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getSession } from '@/lib/supabase-auth';
import { LayoutDashboard, ShoppingBag, FileText, Users, LogOut, Scale, Layers, CalendarDays, X, Zap, Settings, Clock } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', path: '/dashboard/services', icon: Layers },
    { id: 'bookings', label: 'Bookings', path: '/dashboard/bookings', icon: CalendarDays },
    { id: 'products', label: 'Products', path: '/dashboard/products', icon: ShoppingBag },
    { id: 'content', label: 'Content', path: '/dashboard/content', icon: FileText },
    { id: 'subscribers', label: 'Subscribers', path: '/dashboard/subscribers', icon: Users },
    { id: 'legal', label: 'Legal Pages', path: '/dashboard/legal', icon: Scale },
    { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

const MOTIVATION_MESSAGES = [
    {
        icon: Zap,
        headline: "Are you building or just busy?",
        body: "Gerak kerja tanpa hasil adalah pembaziran. Jangan betulkan benda yang tak perlu. Fokus pada satu benda yang gerakkan bisnes hari ini.",
        button: "I'm Ready to Execute",
        color: "from-red-500 to-orange-500",
        headlineColor: "text-red-400",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400"
    },
    {
        icon: Settings,
        headline: "Order out of Chaos.",
        body: "Tugas kau bukan untuk buat semua benda. Tugas kau adalah membina sistem supaya benda tu jalan sendiri. Build the machine, don't just be a gear.",
        button: "Let's Build",
        color: "from-blue-500 to-cyan-500",
        headlineColor: "text-blue-400",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400"
    },
    {
        icon: Clock,
        headline: "Jam sedang berdetik.",
        body: "Esok belum tentu ada. Apa legasi yang kau nak tinggalkan hari ini? Pastikan setiap klik dan setiap ayat ada nilainya.",
        button: "Start",
        color: "from-purple-500 to-pink-500",
        headlineColor: "text-purple-400",
        iconBg: "bg-purple-500/20",
        iconColor: "text-purple-400"
    }
];

function MotivationPopup({ onClose }: { onClose: () => void }) {
    const [message] = useState(() => {
        const index = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
        return MOTIVATION_MESSAGES[index];
    });

    const IconComponent = message.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl animate-scale-in">
                {/* Icon */}
                <div className={`w-16 h-16 ${message.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className={`w-8 h-8 ${message.iconColor}`} />
                </div>

                {/* Content */}
                <h2 className={`text-2xl font-bold text-center mb-4 ${message.headlineColor}`}>
                    {message.headline}
                </h2>
                <p className="text-slate-300 text-center leading-relaxed mb-8">
                    {message.body}
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className={`w-full py-4 px-6 bg-gradient-to-r ${message.color} text-white font-bold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg`}
                >
                    {message.button}
                </button>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [showMotivation, setShowMotivation] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const session = await getSession();
            if (!session) {
                router.push('/login');
            } else {
                setAuthenticated(true);
                // Show motivation popup after login
                const lastShown = sessionStorage.getItem('motivation_shown');
                if (!lastShown) {
                    setShowMotivation(true);
                    sessionStorage.setItem('motivation_shown', 'true');
                }
            }
            setLoading(false);
        }
        checkAuth();
    }, [router]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    // Not authenticated - will redirect
    if (!authenticated) {
        return null;
    }

    // Full-screen mode for /write pages (no sidebar)
    const isFullScreen = pathname?.includes('/write');

    if (isFullScreen) {
        return <>{children}</>;
    }

    return (
        <>
            {showMotivation && (
                <MotivationPopup onClose={() => setShowMotivation(false)} />
            )}

            <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
                {/* Sidebar */}
                <aside className="w-72 bg-slate-900 text-slate-400 flex flex-col fixed h-full z-20">
                    {/* Logo */}
                    <div className="p-8 h-24 flex items-center border-b border-slate-800">
                        <div>
                            <div className="text-white font-bold text-lg">OPERATOR</div>
                            <span className="text-slate-400 text-xs">SYSTEM OS</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.path ||
                                (item.path !== '/dashboard' && pathname?.startsWith(item.path));

                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? 'bg-emerald-500 text-slate-900'
                                        : 'hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-800 space-y-2">
                        <button
                            onClick={async () => {
                                await signOut();
                                sessionStorage.removeItem('motivation_shown');
                                window.location.href = '/login';
                            }}
                            className="flex items-center gap-2 text-sm hover:text-white transition-colors w-full"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-72 p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </>
    );
}
