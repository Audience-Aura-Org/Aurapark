'use client';

import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
    const [isHovered, setIsHovered] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const theme = localStorage.getItem('theme') || 'system';
        const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(dark);
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
    };

    // Don't render until mounted on client
    if (!isMounted) {
        return <div className="w-10 h-10 rounded-2xl" />;
    }

    return (
        <button
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative inline-flex items-center justify-center p-3 rounded-2xl glass-panel transition-all duration-300 hover:shadow-glass-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-purple-400"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun Icon */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
                } text-accent-400`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707.707M6.343 17.657l-.707.707m12.728 0l.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>

            {/* Moon Icon */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
                } text-purple-400`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>

            {/* Hover tooltip */}
            {isHovered && (
                <div className="absolute bottom-full mb-2 px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg whitespace-nowrap animate-fade-up">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </div>
            )}
        </button>
    );
}
