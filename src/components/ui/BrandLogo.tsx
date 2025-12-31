import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
    dark?: boolean;
    align?: 'center' | 'start';
}

export function BrandLogo({ dark = false, align = 'center' }: BrandLogoProps) {
    return (
        <div className={`flex flex-col ${align === 'center' ? 'items-center' : 'items-start'} cursor-pointer group select-none`}>
            <div className={`text-3xl font-black tracking-tighter leading-none lowercase transition-colors ${dark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                asrulbasri<span className={dark ? 'text-emerald-400' : 'text-emerald-600'}>.</span>
            </div>
            <div className={`text-[10px] tracking-[0.3em] lowercase mt-1 font-medium ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                we craft our journey
            </div>
            <div className={`text-[9px] font-mono mt-1 text-center leading-tight ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                since<br />2020
            </div>
        </div>
    );
}
