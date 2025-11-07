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
      className="relative w-20 h-10 rounded-full transition-all duration-700 ease-in-out focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 dark:focus:ring-offset-background-dark"
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

      {/* Light Mode: Sun - slides from left to right */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-700 ease-in-out ${
          theme === 'dark'
            ? 'left-1 translate-x-0 opacity-0 scale-0 rotate-0'
            : 'left-1 translate-x-0 opacity-100 scale-100 rotate-360'
        } ${isAnimating ? 'animate-spin' : ''}`}
      >
        <div className="absolute inset-0 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6),0_0_40px_rgba(250,204,21,0.4)]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
      </div>

      {/* Dark Mode: Moon - slides from right to left */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-700 ease-in-out ${
          theme === 'dark'
            ? 'right-1 translate-x-0 opacity-100 scale-100 rotate-360'
            : 'right-1 translate-x-0 opacity-0 scale-0 rotate-0'
        } ${isAnimating ? 'animate-spin' : ''}`}
      >
        <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-400" />
        {/* Moon craters */}
        <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
        <div className="absolute top-1/2 right-1 w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-600 opacity-60" />
      </div>

      {/* Light Mode: Clouds */}
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-700 ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Cloud made from overlapping circles */}
        <div className="relative">
          {/* Main cloud body */}
          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white/90" />
          <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-white/90" />
          <div className="absolute left-2 top-0 w-4 h-4 rounded-full bg-white/90" />
          <div className="absolute left-0.5 -top-1 w-3 h-3 rounded-full bg-white/90" />
          <div className="absolute left-2.5 -top-1 w-3 h-3 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Dark Mode: Stars */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Twinkling stars */}
        <div className="absolute left-3 top-2 w-1 h-1 rounded-full bg-white animate-pulse" />
        <div className="absolute left-6 top-3 w-0.5 h-0.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute left-4 top-5 w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
        <div className="absolute left-8 top-2 w-0.5 h-0.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute left-10 top-4 w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute left-7 top-6 w-0.5 h-0.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-lg dark:shadow-gray-900/50" />
    </button>
  )
}

