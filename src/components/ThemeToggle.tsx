import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative w-20 h-10 rounded-full transition-all duration-700 ease-in-out focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 dark:focus:ring-offset-background-dark overflow-hidden"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background with gradient */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isDark
            ? 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800'
            : 'bg-gradient-to-r from-sky-300 via-sky-400 to-sky-300'
        }`}
      />

      {/* Single sliding element: Sun transforms to Moon */}
      <div
        className="absolute top-1/2 w-8 h-8 rounded-full transition-all duration-700 ease-in-out transform -translate-y-1/2"
        style={{
          left: isDark ? 'calc(100% - 2.5rem)' : '0.25rem',
          transform: `translateY(-50%) ${isDark ? 'rotate(360deg)' : 'rotate(0deg)'}`,
        }}
      >
        {/* Sun (visible in light mode) */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6),0_0_40px_rgba(250,204,21,0.4)]" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
        </div>

        {/* Moon (visible in dark mode) */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-400" />
          {/* Moon craters */}
          <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
          <div className="absolute top-1/2 right-1 w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        </div>
      </div>

      {/* Light Mode: Realistic Clouds */}
      <div
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-700 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <svg width="32" height="20" viewBox="0 0 32 20" className="pointer-events-none">
          {/* Cloud 1 - Main cloud */}
          <ellipse cx="12" cy="12" rx="6" ry="4" fill="white" opacity="0.95" />
          <ellipse cx="16" cy="10" rx="5" ry="3.5" fill="white" opacity="0.95" />
          <ellipse cx="20" cy="12" rx="5" ry="4" fill="white" opacity="0.95" />
          
          {/* Cloud 2 - Smaller cloud above */}
          <ellipse cx="18" cy="6" rx="3" ry="2" fill="white" opacity="0.9" />
          <ellipse cx="20" cy="5" rx="2.5" ry="1.8" fill="white" opacity="0.9" />
          
          {/* Cloud 3 - Small cloud below */}
          <ellipse cx="24" cy="16" rx="2.5" ry="2" fill="white" opacity="0.85" />
          <ellipse cx="26" cy="15.5" rx="2" ry="1.5" fill="white" opacity="0.85" />
        </svg>
      </div>

      {/* Dark Mode: Stars */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Twinkling stars with staggered animations */}
        <div 
          className="absolute left-3 top-2 w-1 h-1 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '0s', animationDuration: '2s' }}
        />
        <div 
          className="absolute left-6 top-3 w-0.5 h-0.5 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '0.3s', animationDuration: '2s' }}
        />
        <div 
          className="absolute left-4 top-5 w-1 h-1 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '0.6s', animationDuration: '2s' }}
        />
        <div 
          className="absolute left-8 top-2 w-0.5 h-0.5 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '0.9s', animationDuration: '2s' }}
        />
        <div 
          className="absolute left-10 top-4 w-1 h-1 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '1.2s', animationDuration: '2s' }}
        />
        <div 
          className="absolute left-7 top-6 w-0.5 h-0.5 rounded-full bg-white animate-pulse" 
          style={{ animationDelay: '1.5s', animationDuration: '2s' }}
        />
      </div>

      {/* Shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-lg dark:shadow-gray-900/50" />
    </button>
  )
}
