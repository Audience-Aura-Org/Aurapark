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
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-400 text-neutral-800 shadow-inner-glow hover:bg-primary-300 hover:scale-105 focus:ring-primary-200',
        accent: 'bg-accent-400 text-white shadow-inner-glow-orange hover:bg-accent-500 hover:scale-105 focus:ring-accent-200 animate-pop',
        glass: 'glass-panel text-neutral-700 font-semibold hover:bg-white/80 hover:scale-105 focus:ring-primary-200',
        danger: 'bg-danger-500 text-white shadow-soft hover:bg-danger-600 hover:scale-105 focus:ring-danger-200',
        success: 'bg-success-500 text-white shadow-soft hover:bg-success-600 hover:scale-105 focus:ring-success-200',
        secondary: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:scale-105 focus:ring-neutral-200',
        outline: 'border-2 border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-100',
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-100',
        warning: 'bg-warning-500 text-white shadow-soft hover:bg-warning-600 hover:scale-105 focus:ring-warning-200'
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
