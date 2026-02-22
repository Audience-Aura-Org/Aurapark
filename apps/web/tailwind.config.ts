import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Base colors
                background: "#F0FFF4",
                foreground: "#1A202C",

                // Premium colors for dark mode
                'dark-bg': '#0F172A',
                'dark-bg-secondary': '#1E293B',
                'dark-fg': '#F8FAFC',

                // Primary - Emerald Green (Premium)
                primary: {
                    50: '#F0FFF4',
                    100: '#C6F6D5',
                    200: '#9AE6B4',
                    300: '#68D391',
                    400: '#10B981', // Premium emerald green
                    500: '#059669',
                    600: '#047857',
                    700: '#065F46',
                    800: '#064E3B',
                    900: '#022C1D'
                },

                // Accent - Premium Gold
                accent: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24', // Premium gold
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F'
                },

                // Success - Soft Green
                success: {
                    50: '#F0FFF4',
                    100: '#C6F6D5',
                    200: '#9AE6B4',
                    300: '#68D391',
                    400: '#48BB78',
                    500: '#38A169',
                    600: '#2F855A',
                    700: '#276749',
                    800: '#22543D',
                    900: '#1C4532'
                },

                // Warning - Soft Yellow
                warning: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F'
                },

                // Danger - Soft Red
                danger: {
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    200: '#FECACA',
                    300: '#FCA5A5',
                    400: '#F87171',
                    500: '#EF4444',
                    600: '#DC2626',
                    700: '#B91C1C',
                    800: '#991B1B',
                    900: '#7F1D1D'
                },

                // Neutral scale
                neutral: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717'
                }
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
                display: ['Poppins', 'sans-serif']
            },
            fontSize: {
                'xs': ['11px', { lineHeight: '16px', fontWeight: '500' }],
                'sm': ['12px', { lineHeight: '18px', fontWeight: '500' }],
                'base': ['14px', { lineHeight: '21px', fontWeight: '500' }],
                'lg': ['16px', { lineHeight: '24px', fontWeight: '600' }],
                'xl': ['18px', { lineHeight: '26px', fontWeight: '600' }],
                '2xl': ['21px', { lineHeight: '28px', fontWeight: '700' }],
                '3xl': ['26px', { lineHeight: '32px', fontWeight: '700' }],
                '4xl': ['32px', { lineHeight: '36px', fontWeight: '800' }],
                '5xl': ['42px', { lineHeight: '1', fontWeight: '800' }],
                '6xl': ['52px', { lineHeight: '1', fontWeight: '900' }],
                '7xl': ['63px', { lineHeight: '1', fontWeight: '900' }],
                '8xl': ['84px', { lineHeight: '1', fontWeight: '900' }]
            },
            borderRadius: {
                'xl': '14px',
                '2xl': '21px',
                '3xl': '28px',
                '4xl': '35px'
            },
            spacing: {
                'xs': '3px',
                'sm': '6px',
                'md': '14px',
                'lg': '21px',
                'xl': '28px',
                '2xl': '35px',
                '3xl': '42px',
                '4xl': '49px',
                '5xl': '56px'
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
                'float': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
                'inner-glow': 'inset 0 2px 8px 0 rgba(144, 238, 144, 0.3)',
                'inner-glow-orange': 'inset 0 2px 8px 0 rgba(255, 140, 0, 0.3)',
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.1)',
                'none': 'none'
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '12px',
                lg: '16px',
                xl: '24px',
                '2xl': '40px'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-up': 'fadeUp 0.6s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pop': 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                pop: {
                    '0%': { transform: 'scale(0.8)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' }
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                }
            },
            backgroundImage: {
                'gradient-green': 'linear-gradient(135deg, #F0FFF4 0%, #FFFFFF 100%)',
                'gradient-green-soft': 'linear-gradient(135deg, #C6F6D5 0%, #F0FFF4 50%, #FFFFFF 100%)',
                'mesh-green': 'radial-gradient(at 40% 20%, rgba(144, 238, 144, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255, 140, 0, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(144, 238, 144, 0.2) 0px, transparent 50%)'
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography')
    ],
};

export default config;
