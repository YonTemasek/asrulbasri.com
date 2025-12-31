'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    // Dashboard has its own layout, no Header/Footer needed
    if (isDashboard) {
        return <>{children}</>;
    }

    // Public pages get Header and Footer
    return (
        <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
