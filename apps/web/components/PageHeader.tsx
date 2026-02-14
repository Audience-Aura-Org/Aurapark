'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    breadcrumbs?: string[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="liquid-glass-premium p-6 md:p-8 mb-6 animate-fade-up">
            {/* Accent edge */}
            <div className="absolute left-4 top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-primary-400/70 via-primary-500 to-primary-400/70 shadow-sm" />
            
            <div className="pl-5 md:pl-6">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-neutral-500">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className={index === breadcrumbs.length - 1 ? 'text-primary-600 font-semibold' : 'hover:text-neutral-700 transition-colors'}>
                                    {crumb}
                                </span>
                                {index < breadcrumbs.length - 1 && (
                                    <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Header Content */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-2">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-base md:text-lg font-medium text-neutral-600 max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    {actions && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
