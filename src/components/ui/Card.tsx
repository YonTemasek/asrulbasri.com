import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({
    children,
    className = "",
    hover = true,
    onClick
}: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white border border-slate-200 rounded-2xl p-6 
        ${hover ? 'hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
}
