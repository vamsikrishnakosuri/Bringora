import { useTheme } from '@/contexts/ThemeContext'
import logoImage from '../Logo.png'

export default function Logo({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-shrink-0 w-8 h-8">
        {/* Logo container with background */}
        <div 
          className={`w-full h-full rounded-lg flex items-center justify-center transition-colors duration-300 ${
            isDark ? 'bg-black' : 'bg-white'
          }`}
        >
          {/* Logo image - invert in light mode to show white triangles as black */}
          <img
            src={logoImage}
            alt="Bringora Logo"
            className={`w-full h-full object-contain transition-all duration-300 ${
              isDark 
                ? '' // Keep original in dark mode
                : 'brightness-0 invert' // Invert: white becomes black, black becomes white
            }`}
            style={{
              filter: isDark 
                ? 'none' 
                : 'brightness(0) invert(1)' // Makes white triangles black, black bg becomes white
            }}
          />
        </div>
      </div>
      <span className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
        Bringora
      </span>
    </div>
  )
}
