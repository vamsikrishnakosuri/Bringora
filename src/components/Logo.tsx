import { useTheme } from '@/contexts/ThemeContext'

export default function Logo({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  
  // For dark mode: white chevrons on black (original design)
  // For light mode: black chevrons on white (inverted for visibility)
  const isDark = theme === 'dark'
  
  // Gradient colors - inverted based on theme
  const gradientColors = isDark 
    ? ['#404040', '#707070', '#A0A0A0', '#FFFFFF'] // Dark to light (original)
    : ['#BFBFBF', '#8F8F8F', '#5F5F5F', '#000000'] // Light to dark (inverted)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background - black in dark mode, white in light mode */}
        <rect
          width="32"
          height="32"
          rx="6"
          fill={isDark ? '#000000' : '#FFFFFF'}
          className="transition-colors duration-300"
        />
        
        {/* Top Chevron with gradient layers */}
        <g>
          {/* Layer 1 - Darkest (leftmost) */}
          <path
            d="M 6 10 L 8 11 L 6 12 Z"
            fill={gradientColors[0]}
            className="transition-colors duration-300"
          />
          {/* Layer 2 - Medium dark */}
          <path
            d="M 8 10 L 10 11 L 8 12 Z"
            fill={gradientColors[1]}
            className="transition-colors duration-300"
          />
          {/* Layer 3 - Medium light */}
          <path
            d="M 10 10 L 12 11 L 10 12 Z"
            fill={gradientColors[2]}
            className="transition-colors duration-300"
          />
          {/* Layer 4 - Brightest (rightmost) */}
          <path
            d="M 12 10 L 14 11 L 12 12 Z"
            fill={gradientColors[3]}
            className="transition-colors duration-300"
          />
        </g>
        
        {/* Bottom Chevron with gradient layers (mirrored) */}
        <g>
          {/* Layer 1 - Darkest (leftmost) */}
          <path
            d="M 6 20 L 8 21 L 6 22 Z"
            fill={gradientColors[0]}
            className="transition-colors duration-300"
          />
          {/* Layer 2 - Medium dark */}
          <path
            d="M 8 20 L 10 21 L 8 22 Z"
            fill={gradientColors[1]}
            className="transition-colors duration-300"
          />
          {/* Layer 3 - Medium light */}
          <path
            d="M 10 20 L 12 21 L 10 22 Z"
            fill={gradientColors[2]}
            className="transition-colors duration-300"
          />
          {/* Layer 4 - Brightest (rightmost) */}
          <path
            d="M 12 20 L 14 21 L 12 22 Z"
            fill={gradientColors[3]}
            className="transition-colors duration-300"
          />
        </g>
      </svg>
      <span className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
        Bringora
      </span>
    </div>
  )
}
