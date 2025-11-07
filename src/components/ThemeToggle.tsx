import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 700)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-20 h-10 rounded-full transition-all duration-700 ease-in-out focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 dark:focus:ring-offset-background-dark overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Background with gradient */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800'
            : 'bg-gradient-to-r from-sky-300 via-sky-400 to-sky-300'
        }`}
      />

      {/* Light Mode: Sun - positioned on left, slides smoothly */}
      <div
        className={`absolute top-1/2 left-1 w-8 h-8 rounded-full transition-all duration-700 ease-in-out transform -translate-y-1/2 ${
          theme === 'dark'
            ? 'opacity-0 scale-0 rotate-0 translate-x-0'
            : 'opacity-100 scale-100 rotate-360 translate-x-0'
        }`}
        style={{
          transform: theme === 'dark' 
            ? 'translateY(-50%) translateX(0) scale(0) rotate(0deg)' 
            : 'translateY(-50%) translateX(0) scale(1) rotate(360deg)',
          transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6),0_0_40px_rgba(250,204,21,0.4)]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
      </div>

      {/* Dark Mode: Moon - positioned on right, slides smoothly */}
      <div
        className={`absolute top-1/2 right-1 w-8 h-8 rounded-full transition-all duration-700 ease-in-out transform -translate-y-1/2 ${
          theme === 'dark'
            ? 'opacity-100 scale-100 rotate-360 translate-x-0'
            : 'opacity-0 scale-0 rotate-0 translate-x-0'
        }`}
        style={{
          transform: theme === 'dark'
            ? 'translateY(-50%) translateX(0) scale(1) rotate(360deg)'
            : 'translateY(-50%) translateX(0) scale(0) rotate(0deg)',
          transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-400" />
        {/* Moon craters */}
        <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        <div className="absolute top-1/2 right-1 w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
      </div>

      {/* Light Mode: Clouds - positioned on right side, fade smoothly */}
      <div
        className={`absolute top-1/2 right-2 transform -translate-y-1/2 transition-opacity duration-700 ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Cloud made from overlapping circles - positioned correctly */}
        <div className="relative w-8 h-6">
          {/* Bottom row of cloud */}
          <div className="absolute -left-1 bottom-0 w-3 h-3 rounded-full bg-white/95" />
          <div className="absolute left-1 bottom-0 w-4 h-4 rounded-full bg-white/95" />
          <div className="absolute left-3 bottom-0 w-3 h-3 rounded-full bg-white/95" />
          {/* Top row of cloud */}
          <div className="absolute left-0.5 top-0 w-2.5 h-2.5 rounded-full bg-white/95" />
          <div className="absolute left-2.5 top-0 w-2.5 h-2.5 rounded-full bg-white/95" />
        </div>
      </div>

      {/* Dark Mode: Stars - positioned across the toggle, twinkling */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
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
