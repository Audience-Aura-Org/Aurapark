'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="glass-panel p-16 text-center animate-fade-up">
            {/* Icon */}
            {icon && (
                <div className="inline-flex items-center justify-center w-24 h-24 glass-panel text-neutral-400 mb-6">
                    {icon}
                </div>
            )}

            {/* Content */}
            <h3 className="text-2xl font-black text-neutral-900 mb-3">
                {title}
            </h3>
            <p className="text-neutral-700 font-medium mb-8 max-w-md mx-auto">
                {description}
            </p>

            {/* Action */}
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
