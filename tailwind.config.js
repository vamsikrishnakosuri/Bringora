/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Premium monochrome theme with better contrast
                background: {
                    DEFAULT: '#FFFFFF',
                    dark: '#0A0A0A', // Slightly off-black for depth
                },
                foreground: {
                    DEFAULT: '#000000',
                    dark: '#F5F5F5', // Soft white for better readability
                },
                card: {
                    DEFAULT: '#FAFAFA',
                    dark: '#1A1A1A', // Dark charcoal with subtle warmth
                },
                border: {
                    DEFAULT: '#E8E8E8',
                    dark: '#2A2A2A', // Lighter border for better definition
                },
                muted: {
                    DEFAULT: '#6B6B6B',
                    dark: '#A0A0A0', // Lighter gray for better contrast
                },
                accent: {
                    DEFAULT: '#000000',
                    dark: '#FFFFFF',
                },
            },
            animation: {
                'gradient': 'gradient 8s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            boxShadow: {
                'premium': '0 10px 40px rgba(0, 0, 0, 0.1)',
                'premium-dark': '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'card-dark': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
                'glow-dark': '0 0 30px rgba(255, 255, 255, 0.15)',
            },
        },
    },
    plugins: [],
}

