/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Monochrome premium theme
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#000000',
        },
        foreground: {
          DEFAULT: '#000000',
          dark: '#FFFFFF',
        },
        card: {
          DEFAULT: '#F5F5F5',
          dark: '#1A1A1A',
        },
        border: {
          DEFAULT: '#E5E5E5',
          dark: '#333333',
        },
        muted: {
          DEFAULT: '#9A9A9A',
          dark: '#666666',
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
        'premium-dark': '0 10px 40px rgba(255, 255, 255, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 4px 20px rgba(255, 255, 255, 0.03)',
      },
    },
  },
  plugins: [],
}

