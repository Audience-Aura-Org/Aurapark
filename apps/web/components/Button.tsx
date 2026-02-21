'use client';

import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'glass' | 'danger' | 'success' | 'secondary' | 'outline' | 'ghost' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children?: ReactNode;
    as?: ElementType;
    href?: string;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    as: Component = 'button',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
        primary: 'bg-primary-400 dark:bg-emerald-500 text-neutral-800 dark:text-white shadow-inner-glow hover:bg-primary-300 dark:hover:bg-emerald-600 hover:scale-105 focus:ring-primary-200 dark:focus:ring-emerald-400',
        accent: 'bg-accent-400 dark:bg-purple-600 text-white dark:text-white shadow-inner-glow-orange dark:shadow-inner-glow hover:bg-accent-500 dark:hover:bg-purple-700 hover:scale-105 focus:ring-accent-200 dark:focus:ring-purple-300 animate-pop',
        glass: 'glass-panel text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:scale-105 focus:ring-primary-200 dark:focus:ring-purple-400',
        danger: 'bg-danger-500 dark:bg-danger-600 text-white shadow-soft hover:bg-danger-600 dark:hover:bg-danger-700 hover:scale-105 focus:ring-danger-200 dark:focus:ring-danger-400',
        success: 'bg-success-500 dark:bg-success-600 text-white shadow-soft hover:bg-success-600 dark:hover:bg-success-700 hover:scale-105 focus:ring-success-200 dark:focus:ring-success-400',
        secondary: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:scale-105 focus:ring-neutral-200 dark:focus:ring-neutral-600',
        outline: 'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-primary-400 dark:hover:border-purple-500 hover:text-primary-600 dark:hover:text-purple-400 hover:bg-primary-50 dark:hover:bg-purple-950/30 focus:ring-primary-100 dark:focus:ring-purple-900',
        ghost: 'bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white focus:ring-neutral-100 dark:focus:ring-neutral-700',
        warning: 'bg-warning-500 dark:bg-warning-600 text-white shadow-soft hover:bg-warning-600 dark:hover:bg-warning-700 hover:scale-105 focus:ring-warning-200 dark:focus:ring-warning-400'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <Component
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...(Component === 'button' ? { type: 'button' } : {})}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </Component>
    );
}
