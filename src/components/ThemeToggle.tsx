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

      {/* Single sliding container: Sun transforms to Moon as it slides */}
      <div
        className="absolute top-1/2 w-8 h-8 rounded-full transform -translate-y-1/2 transition-all duration-700 ease-in-out"
        style={{
          left: isDark ? 'calc(100% - 2.5rem)' : '0.25rem',
          transition: 'left 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Sun - fades out as it moves right */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0deg)',
            transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6),0_0_40px_rgba(250,204,21,0.4)]" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
        </div>

        {/* Moon - fades in as it moves left */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'scale(1) rotate(180deg)' : 'scale(0) rotate(0deg)',
            transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-400" />
          {/* Moon craters */}
          <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
          <div className="absolute top-1/2 right-1 w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        </div>
      </div>

      {/* Light Mode: Premium Fluffy Clouds */}
      <div
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-700 ${
          isDark ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <svg width="32" height="20" viewBox="0 0 32 20" className="pointer-events-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
          {/* Main cloud body - larger, fluffier */}
          <ellipse cx="8" cy="13" rx="5.5" ry="4" fill="white" opacity="0.98" />
          <ellipse cx="12" cy="10.5" rx="5" ry="3.5" fill="white" opacity="0.98" />
          <ellipse cx="16" cy="13" rx="5" ry="4" fill="white" opacity="0.98" />
          <ellipse cx="19.5" cy="11" rx="4" ry="3" fill="white" opacity="0.98" />
          <ellipse cx="22" cy="13" rx="3.5" ry="2.5" fill="white" opacity="0.98" />
          
          {/* Upper cloud puffs - more natural */}
          <ellipse cx="13" cy="6" rx="3" ry="2.2" fill="white" opacity="0.95" />
          <ellipse cx="16" cy="5.5" rx="2.5" ry="2" fill="white" opacity="0.95" />
          <ellipse cx="18.5" cy="6.5" rx="2.2" ry="1.8" fill="white" opacity="0.95" />
          
          {/* Subtle highlight for depth */}
          <ellipse cx="12" cy="10" rx="3" ry="2" fill="white" opacity="0.3" />
        </svg>
      </div>

      {/* Dark Mode: Twinkling Stars with varied sizes and positions */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Large twinkling stars */}
        <div 
          className="absolute left-2.5 top-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" 
          style={{ 
            animationDelay: '0s', 
            animationDuration: '2.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-9 top-3.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" 
          style={{ 
            animationDelay: '0.8s', 
            animationDuration: '2.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-6 top-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" 
          style={{ 
            animationDelay: '1.6s', 
            animationDuration: '2.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        
        {/* Medium stars */}
        <div 
          className="absolute left-4 top-1.5 w-1 h-1 rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.6)] animate-pulse" 
          style={{ 
            animationDelay: '0.4s', 
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-7 top-5 w-1 h-1 rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.6)] animate-pulse" 
          style={{ 
            animationDelay: '1.2s', 
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-11 top-2 w-1 h-1 rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.6)] animate-pulse" 
          style={{ 
            animationDelay: '0.6s', 
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        
        {/* Small twinkling stars */}
        <div 
          className="absolute left-3 top-4 w-0.5 h-0.5 rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.5)] animate-pulse" 
          style={{ 
            animationDelay: '0.2s', 
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-8 top-1 w-0.5 h-0.5 rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.5)] animate-pulse" 
          style={{ 
            animationDelay: '1s', 
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-10 top-6 w-0.5 h-0.5 rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.5)] animate-pulse" 
          style={{ 
            animationDelay: '1.4s', 
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <div 
          className="absolute left-5 top-7.5 w-0.5 h-0.5 rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.5)] animate-pulse" 
          style={{ 
            animationDelay: '0.8s', 
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </div>

      {/* Shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-lg dark:shadow-gray-900/50" />
    </button>
  )
}
