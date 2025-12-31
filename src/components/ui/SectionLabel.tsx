import React from 'react';

interface SectionLabelProps {
    text: string;
    light?: boolean;
}

export function SectionLabel({ text, light = false }: SectionLabelProps) {
    return (
        <div className="flex items-center gap-2 mb-6">
            <span className={`h-px w-8 ${light ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
            <span className={`text-xs font-mono uppercase tracking-widest font-bold ${light ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {text}
            </span>
        </div>
    );
}
