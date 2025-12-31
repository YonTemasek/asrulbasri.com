'use client';

import { useEffect } from 'react';

interface ContentProtectionProps {
    children: React.ReactNode;
    enableRightClickBlock?: boolean;
    enableTextSelectionBlock?: boolean;
    showCopyrightNotice?: boolean;
}

export function ContentProtection({
    children,
    enableRightClickBlock = true,
    enableTextSelectionBlock = false,
    showCopyrightNotice = true,
}: ContentProtectionProps) {
    useEffect(() => {
        // Disable right-click
        const handleContextMenu = (e: MouseEvent) => {
            if (enableRightClickBlock) {
                e.preventDefault();
                return false;
            }
        };

        // Disable common keyboard shortcuts for copying
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 's' || e.key === 'u')
            ) {
                // Allow Ctrl+A for accessibility, but warn
                if (e.key === 'a') return;
                e.preventDefault();
                return false;
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        if (enableTextSelectionBlock) {
            document.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [enableRightClickBlock, enableTextSelectionBlock]);

    return (
        <div
            style={{
                WebkitTouchCallout: 'none',
            }}
        >
            {children}
            {showCopyrightNotice && (
                <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-500">
                    <p>
                        © {new Date().getFullYear()} Asrul Basri. All rights reserved.
                        This content is protected by copyright law. Unauthorized reproduction or distribution is prohibited.
                    </p>
                </div>
            )}
        </div>
    );
}
