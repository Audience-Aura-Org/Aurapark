'use client';

import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'orange' | 'default';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({ children, variant = 'info', size = 'md', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-success-100 text-success-900 border-success-300',
        warning: 'bg-warning-100 text-warning-900 border-warning-300',
        danger: 'bg-danger-100 text-danger-900 border-danger-300',
        info: 'bg-primary-100 text-primary-900 border-primary-300',
        orange: 'bg-accent-400 text-white border-accent-500 shadow-inner-glow-orange animate-pop',
        default: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded-xl border
            ${variants[variant]} ${sizes[size]} ${className}
        `}>
            {children}
        </span>
    );
}
