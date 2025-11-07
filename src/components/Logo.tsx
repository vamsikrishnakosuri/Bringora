import { useTheme } from '@/contexts/ThemeContext'

export default function Logo({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Gradient colors - 3 segments: dark gray → medium gray → white
  // Inverted for light mode for visibility
  const segment1 = isDark ? '#404040' : '#BFBFBF' // Dark gray
  const segment2 = isDark ? '#808080' : '#808080' // Medium gray
  const segment3 = isDark ? '#FFFFFF' : '#000000' // White (or black in light mode)
  const backgroundColor = isDark ? '#000000' : '#FFFFFF'
  const separatorColor = isDark ? '#000000' : '#FFFFFF' // Black lines/gaps

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
        {/* Background */}
        <rect
          width="32"
          height="32"
          rx="6"
          fill={backgroundColor}
          className="transition-colors duration-300"
        />
        
        {/* Top Row - 3 segments with gradient */}
        <g>
          {/* Segment 1 - Dark gray (leftmost) */}
          <path
            d="M 6 10 L 9 11.5 L 6 13 Z"
            fill={segment1}
            className="transition-colors duration-300"
          />
          {/* Black separator line */}
          <line
            x1="9"
            y1="10"
            x2="9"
            y2="13"
            stroke={separatorColor}
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />
          
          {/* Segment 2 - Medium gray (middle) */}
          <path
            d="M 9.5 10 L 12.5 11.5 L 9.5 13 Z"
            fill={segment2}
            className="transition-colors duration-300"
          />
          {/* Black separator line */}
          <line
            x1="12.5"
            y1="10"
            x2="12.5"
            y2="13"
            stroke={separatorColor}
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />
          
          {/* Segment 3 - White (rightmost) */}
          <path
            d="M 13 10 L 16 11.5 L 13 13 Z"
            fill={segment3}
            className="transition-colors duration-300"
          />
        </g>
        
        {/* Bottom Row - Mirrored, same gradient */}
        <g>
          {/* Segment 1 - Dark gray (leftmost) */}
          <path
            d="M 6 19 L 9 20.5 L 6 22 Z"
            fill={segment1}
            className="transition-colors duration-300"
          />
          {/* Black separator line */}
          <line
            x1="9"
            y1="19"
            x2="9"
            y2="22"
            stroke={separatorColor}
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />
          
          {/* Segment 2 - Medium gray (middle) */}
          <path
            d="M 9.5 19 L 12.5 20.5 L 9.5 22 Z"
            fill={segment2}
            className="transition-colors duration-300"
          />
          {/* Black separator line */}
          <line
            x1="12.5"
            y1="19"
            x2="12.5"
            y2="22"
            stroke={separatorColor}
            strokeWidth="0.5"
            className="transition-colors duration-300"
          />
          
          {/* Segment 3 - White (rightmost) */}
          <path
            d="M 13 19 L 16 20.5 L 13 22 Z"
            fill={segment3}
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
