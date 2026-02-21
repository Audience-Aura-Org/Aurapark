'use client';

import { InputHTMLAttributes, ReactNode, useState, useEffect, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    helperText?: string;
}

export function Input({
    label,
    error,
    success,
    leftIcon: leftIconProp,
    rightIcon: rightIconProp,
    icon,
    iconPosition = 'left',
    helperText,
    className = '',
    id,
    type = 'text',
    ...restProps
}: InputProps) {
    const leftIcon = leftIconProp || (iconPosition === 'left' ? icon : undefined);
    const rightIcon = rightIconProp || (iconPosition === 'right' ? icon : undefined);

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!restProps.value || !!restProps.defaultValue);

    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    // Auto-float label for date/time/number inputs
    const shouldFloatLabel = ['date', 'time', 'datetime-local', 'number'].includes(type) || isFocused || hasValue;

    // Filter out any custom props that shouldn't be passed to DOM
    const { onChange, ...inputProps } = restProps;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(e.target.value.length > 0);
        onChange?.(e);
    };

    // Update hasValue when value prop changes
    useEffect(() => {
        setHasValue(!!restProps.value);
    }, [restProps.value]);

    return (
        <div className="w-full">
            <div className="relative">
                {/* Floating Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`
                            absolute ${leftIcon ? 'left-11' : 'left-4'} transition-all duration-200 pointer-events-none z-10
                            ${shouldFloatLabel
                                ? 'top-[-10px] text-xs font-black text-primary-700 bg-white dark:bg-neutral-900 px-1.5 rounded-lg border border-primary-100 dark:border-purple-500/30'
                                : '-top-7 text-xs font-semibold text-neutral-600 dark:text-neutral-400'
                            }
                        `}
                    >
                        {label}
                    </label>
                )}

                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 z-20">
                        {leftIcon}
                    </div>
                )}

                {/* Input */}
                <input
                    id={inputId}
                    type={type}
                    className={`
                        w-full px-4 rounded-xl border-2 outline-none transition-all duration-200
                        bg-white dark:bg-neutral-900 shadow-soft focus:shadow-soft-lg
                        text-neutral-900 dark:text-white font-bold
                        placeholder-neutral-400 dark:placeholder-neutral-500
                        ${shouldFloatLabel ? 'pt-6 pb-2' : `py-3 ${label ? 'mt-2' : ''}`}
                        ${error
                            ? 'border-red-400 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-red-500/70 dark:focus:ring-red-500/30'
                            : success
                                ? 'border-green-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 dark:border-green-500/70 dark:focus:ring-green-500/30'
                                : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:hover:border-neutral-600 dark:focus:border-purple-500 dark:focus:ring-purple-500/30'
                        }
                        ${leftIcon ? 'pl-11' : ''}
                        ${rightIcon ? 'pr-11' : ''}
                        ${className}
                    `}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={handleChange}
                    {...inputProps}
                />

                {/* Right Icon / Status Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                    {error ? (
                        <svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : success ? (
                        <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : rightIcon ? (
                        <span className="text-neutral-400">{rightIcon}</span>
                    ) : null}
                </div>
            </div>

            {/* Helper Text / Error / Success */}
            {(helperText || error || success) && (
                <div className="mt-2 px-4">
                    {error && (
                        <p className="text-sm font-semibold text-danger-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm font-semibold text-success-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {success}
                        </p>
                    )}
                    {helperText && !error && !success && (
                        <p className="text-sm text-neutral-500 font-medium">{helperText}</p>
                    )}
                </div>
            )}
        </div>
    );
}
