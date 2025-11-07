import { useTheme } from '@/contexts/ThemeContext'
import logoImage from '../Logo.png'

export default function Logo({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Logo image with theme-aware filter for visibility */}
        <img
          src={logoImage}
          alt="Bringora Logo"
          width="32"
          height="32"
          className={`transition-all duration-300 ${
            isDark 
              ? 'brightness-0 invert-0' // Original dark logo on dark background
              : 'brightness-0 invert' // Invert for light mode (white triangles become black)
          }`}
          style={{
            filter: isDark 
              ? 'none' // Keep original in dark mode
              : 'invert(1) brightness(0)' // Invert colors for light mode
          }}
        />
      </div>
      <span className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
        Bringora
      </span>
    </div>
  )
}
