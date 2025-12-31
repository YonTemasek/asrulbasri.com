import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    primary?: boolean;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export function Button({
    children,
    primary = false,
    onClick,
    className = "",
    type = "button",
    disabled = false
}: ButtonProps) {
    // Check if custom colors are being passed
    const hasCustomBg = className.includes('bg-');
    const hasCustomText = className.includes('text-');
    const hasCustomBorder = className.includes('border-');

    // Base styles without color
    const baseStyles = `px-6 py-3.5 font-medium text-sm tracking-wide transition-all duration-200 
        flex items-center gap-2 rounded-full shadow-sm hover:shadow-md active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed`;

    // Default color styles (only applied if no custom colors)
    let colorStyles = '';
    if (!hasCustomBg && !hasCustomText) {
        if (primary) {
            colorStyles = 'bg-slate-900 text-white hover:bg-slate-800';
        } else {
            colorStyles = 'bg-white text-slate-900 hover:bg-slate-50';
        }
    }

    // Default border (only if not primary and no custom border)
    let borderStyles = '';
    if (!primary && !hasCustomBorder && !hasCustomBg) {
        borderStyles = 'border border-slate-200 hover:border-slate-300';
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${colorStyles} ${borderStyles} ${className}`}
        >
            {children}
        </button>
    );
}

